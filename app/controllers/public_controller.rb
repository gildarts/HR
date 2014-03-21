#
# Public
#
class PublicController < ApplicationController

	layout "application" # 使用 /app/view/layouts/application.html.erb

	# 顯示 login 頁面，並讓使用者按「登入」。
	def login
		auth_url = Settings[:OAuth_Service][:Authorize]
		client_id = Settings[:Client_ID]
		redirect_uri = get_callback_url(request) # 自動產生 callback uri。

		@login_url = "#{auth_url}?client_id=#{client_id}&response_type=code&redirect_uri=#{redirect_uri}&scope=User.Mail,User.BasicInfo"
	end

	# 由認證中心 Callback，接著完成登入流程，然後重導至 hr Action。
	def login_callback
		uri = URI(Settings[:OAuth_Service][:Token])

		# puts params[:code]

		response = Net::HTTP.post_form(uri,
			'grant_type' => 'authorization_code',
			'code' => params[:code],
			'client_id' => Settings[:Client_ID],
			'client_secret' =>  Settings[:Client_Secret],
			'redirect_uri' => get_callback_url(request)
		)
		
		# puts 'Token Response:' + response.body

		token = JSON.parse(response.body)
		
		puts token.inspect

		uri = URI("#{Settings[:OAuth_Service][:Me]}?access_token=#{token['access_token']}&token_type=bearer")
		result = Net::HTTP.get_response(uri)
		target = JSON.parse(result.body)

		ctor = Contributor.where(["user_id = ?", target['mail']]).first

		if !ctor # 如果找到不該 User，就導向登入失敗頁面。
			redirect_to(action: 'login_fail')
			return
		end

		# 將資訊寫入 Session，系統將用於此資訊判斷是否登入。
		session[:user] = 
		{
			id: ctor.id,
			user_id: target['mail'],
			uuid: target['uuid'],
			name: ctor.name,
			access_token: token['access_token'],
			refresh_token: token['refresh_token'],
			scope: token['scope']
		}

		redirect_to(action: 'hr')
	end

	# 登入失敗頁面。
	def login_fail
		session[:user] = nil
		render 'login_fail', layout: false
	end

	# AngularJS 的主頁，其他 Action 大部份是透過 Ajax Service 的方式呼叫。
	def hr
		if login_required? 
			redirect_to_login
			return
		end
	end

	def logout
		session[:user] = nil;
		@logout_uri = Settings[:OAuth_Service][:Logout]

		redirect_to(@logout_uri)
	end

	def show_current_user
		render json: current_user()
	end

private
	def get_callback_url(req)
		return "#{req.protocol}#{req.host_with_port}#{Settings[:Callback_Path]}"
	end

end
