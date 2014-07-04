#
# Public
#

require 'net/https'

class GoogleController < ApplicationController

  layout false

  def oauth2

    #如果已經有 AccessToken。
    if session[:access_token]
      return unless ensure_access_token
      redirect_to(action: 'authentication_success')
      return
    end

    #從資料庫取得 refresh_token 換 access_token。
    access_token = refresh_token_to_access_token(get_refresh_token)
    if access_token
      session[:access_token] = access_token
      redirect_to(action: 'authentication_success')
      return
    end

    #重新授權流程。
    auth_url = 'https://accounts.google.com/o/oauth2/auth'
    redirect_uri = get_callback_url(request) # 自動產生 callback uri。
    scopes = 'https://www.googleapis.com/auth/calendar.readonly+https://www.googleapis.com/auth/plus.me'
    target_url = "#{auth_url}?client_id=#{Settings[:GAPI_ClientID]}&response_type=code&redirect_uri=#{redirect_uri}&scope=#{scopes}&access_type=offline"

    redirect_to(target_url)
  end

  def oauth2callback

    if params[:error] # 如果發生任何錯誤。
      redirect_to(:action => 'authorization_error')
      return
    end

    uri = URI('https://accounts.google.com/o/oauth2/token')

    response = Net::HTTP.post_form(uri,
                                   'grant_type' => 'authorization_code',
                                   'code' => params[:code],
                                   'client_id' => Settings[:GAPI_ClientID],
                                   'client_secret' => Settings[:GAPI_ClientSecret],
                                   'redirect_uri' => get_callback_url(request)
    )

    token = JSON.parse(response.body)

    session[:access_token] = token['access_token']

    ctor = Contributor.find_by_id(session[:user][:id])
    ctor[:google_refresh_token] = token['refresh_token']
    ctor.save

    redirect_to(action: 'authentication_success')

  end

  def refresh_token_to_access_token(refresh_token)
    uri = URI('https://accounts.google.com/o/oauth2/token')

    response = Net::HTTP.post_form(uri,
                                   'grant_type' => 'refresh_token',
                                   'refresh_token' => refresh_token,
                                   'client_id' => Settings[:GAPI_ClientID],
                                   'client_secret' => Settings[:GAPI_ClientSecret]
    )

    token = JSON.parse(response.body)
    token['access_token'] #沒有的話，就會回傳 nil。
  end

  def ensure_access_token
    userinfo = get_google_data('https://www.googleapis.com/oauth2/v2/userinfo')

    if userinfo['error']
      #試圖換新的 access_token
      access_token = refresh_token_to_access_token(get_refresh_token)

      unless access_token # 還是沒成功的話。
        session[:access_token] = nil
        redirect_to(action: 'authorization_error')
        return false
      end

      session[:access_token] = access_token
    end

    true

  end

  def authentication_success
    #render :text => 'authentication success!'
    redirect_to :action => 'import_calendar'
  end

  def authorization_error
    render :text => '授權失敗，請稍後重試。'
  end

  def import_calendar
    #This is a page to provider feature.
  end

  def get_calendar_list
    render :json => get_google_data('https://www.googleapis.com/calendar/v3/users/me/calendarList')
  end

  def get_event_list
    id = params[:calendar_id]
    last_days = params[:last_days]
    year = params[:year]
    month = params[:month]
    day = params[:day]

    if year && month && day
      now = Time.new(year, month, day)
    else
      now = Time.now
    end

    o_tmax = Time.new(now.year, now.month, now.day, 24, 00, 00)
    o_tmin = o_tmax - ((60 * 60 * 24) * last_days.to_i)

    time_max = ERB::Util::url_encode("#{o_tmax.strftime('%Y-%m-%d')}T00:00:00+08:00")
    time_min = ERB::Util::url_encode("#{o_tmin.strftime('%Y-%m-%d')}T00:00:00+08:00")

    url="https://www.googleapis.com/calendar/v3/calendars/#{id}/events?timeMax=#{time_max}&timeMin=#{time_min}&singleEvents=true&orderBy=startTime"
    render :json => get_google_data(url)
  end

  private

  def get_callback_url(req)
    "#{req.protocol}#{req.host_with_port}/google/oauth2callback"
  end

  def get_refresh_token
    #從資料庫取得 refresh_token。
    ctor = Contributor.find_by_id(session[:user][:id])

    ctor[:google_refresh_token]
  end

  def get_google_data(url)
    #url = URI.parse(url)
    uri = URI(url)

    req = Net::HTTP::Get.new(uri)
    req['Authorization'] = "Bearer #{session[:access_token]}"

    # 注意 :use_ssl 這部份設定重要，不然不 work，就是我搞一整天的結果…
    res = Net::HTTP.start(uri.host, uri.port, :use_ssl => uri.scheme == 'https') { |http|
      #http.use_ssl = false
      http.request(req)
    }

    JSON.parse(res.body)
  end
end
