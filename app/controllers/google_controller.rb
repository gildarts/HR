#
# Public
#

require 'net/https'

class GoogleController < ApplicationController

  layout false

  def oauth2

    #如果已經有 AccessToken
    if session[:access_token]
      redirect_to(action: import_calendar_main)
      return
    end

    ctor = Contributor.find_by_id(session[:user][:id])
    if(ctor[:google_refresh_token])
      refresh_token_to_access_token()
    end

    auth_url = "https://accounts.google.com/o/oauth2/auth"
    redirect_uri = get_callback_url(request) # 自動產生 callback uri。
    scopes = "https://www.googleapis.com/auth/calendar.readonly"
    target_url = "#{auth_url}?client_id=#{Settings[:GAPI_ClientID]}&response_type=code&redirect_uri=#{redirect_uri}&scope=#{scopes}&access_type=offline"

    redirect_to(target_url)
  end

  def oauth2callback
    uri = URI("https://accounts.google.com/o/oauth2/token")

    response = Net::HTTP.post_form(uri,
                                   'grant_type' => 'authorization_code',
                                   'code' => params[:code],
                                   'client_id' => Settings[:GAPI_ClientID],
                                   'client_secret' => Settings[:GAPI_ClientSecret],
                                   'redirect_uri' => get_callback_url(request)
    )

    # puts 'Token Response:' + response.body
    token = JSON.parse(response.body)

    session[:google] = token

    ctor = Contributor.find_by_id(session[:user][:id])
    ctor[:google_refresh_token] = token['refresh_token']
    ctor.save()

    render :text => 'authorization success!'

  end

  def refresh_token_to_access_token

  end

  def refresh_token
  render :text => 'hi...'
  end

  def import_calendar_main

  end

  private

  def get_callback_url(req)
    return "#{req.protocol}#{req.host_with_port}/google/oauth2callback"
  end
end
