class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  # protect_from_forgery with: :exception # 加這行會爆掉。

  NOT_FOUND = 'not found.'
  NOT_FOUND_CODE = '001'

  SESSION_FAIL = 'session not available.'
  SESSION_FAIL_CODE = '002'

  DATE_FORMAT = "%Y/%m/%d"

  # OAUTH -------------------------------------------------------------------------------------------------
  # set_accept_cors
  def set_access_control_headers
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Request-Method'] = '*'
  end
  def check_session
    if session[:user] == nil
      render :json => { error: "We're sorry, but something went wrong." }
      return
    end
  end
  # 目前是否需要登入。
  def login_required?
    (session[:user] == nil)
  end

  # 呼叫之後要記得 return。
  def redirect_to_login
    redirect_to(:controller => "public", :action => "login")
  end

  #回傳一個「不存在」的錯誤訊息。
  def not_found(msg)
    if msg
      Error.new(NOT_FOUND, msg)
    else
      Error.new(NOT_FOUND, NOT_FOUND_CODE)
    end
  end

  # 取得目前使者資訊。
  def current_user
    userid = (session[:user] || {:user_id => nil})[:user_id]

    if userid == nil
      return Error.new(SESSION_FAIL, SESSION_FAIL_CODE)
    end

    ctor = Contributor.select("id, name, user_id, unit_cost").find_by(:user_id => userid)
    ctor || not_found('指定的人員不存在。')
  end

end
