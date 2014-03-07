#CPContribute
class CpcontributeController < ApplicationController
	layout false

	after_filter :set_access_control_headers

	# 列出目前使用者的全部 Contribute。
	def index
		user  = current_user()

		if user.has_attribute?('_error')
			render json: user._error
			return
		end

		result = user.cp_contributes.foregin_info

		render json: result
	end

	# 列出日期區間的 Contribute。
	def between_date
		user  = current_user()

		if user.has_attribute?('_error')
			render json: user._error
			return
		end

		start_date = params[:start]
		end_date = params[:end]

		if (start_date && end_date)
			render json: user.cp_contributes.foregin_info.start_date(start_date).end_date(end_date)
			return
		end

		if (start_date)
			render json: user.cp_contributes.foregin_info.start_date(start_date)
			return
		end

		if (end_date)
			render json: user.cp_contributes.foregin_info.end_date(end_date)
			return
		end
	end

	def show
	end

	def new
		cte = CPContribute.new()

		cte.ref_contributor_id = current_user().id
		cte.ref_project_id = params[:ref_project_id]
		cte.date = params[:date]
		cte.amount = params[:amount]
		cte.description = params[:description]

		cte.save()

		cte = CPContribute.foregin_info.find(cte.id)
		#prj = Project.select(:name).find(cte.ref_project_id)

		#cte.project_name = prj.name

		render json: {message: 'success', result: cte}
	end

	def edit
		cte = CPContribute.find(params[:id])

		if cte == nil
		 	render json: not_found()
		 end

		 cte.ref_project_id = params[:ref_project_id]
		 cte.date = params[:date]
		 cte.amount = params[:amount]
		 cte.description = params[:description]

		cte.save()

		render json: {message: 'success', result: cte}
	end

	def delete
		id = params[:id]

		cpc = CPContribute.find(id)
		cpc.destroy

		render json: {message: 'success'}
	end
end
