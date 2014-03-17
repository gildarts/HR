#
#CPContribute
#
class CpcontributeController < ApplicationController
	layout false

	after_filter :set_access_control_headers

	# 列出目前使用者的全部 Contribute。
	def index
		result = CPContribute.foregin_info

		rsp = []

		# 要這樣做是因為「日期」的格式問題。
		result.each{|p|
			rsp.push(
			{
				id: p.id,
				ref_project_id: p.ref_project_id,
				ref_contributor_id: p.ref_contributor_id,
				date: p.date.strftime(DATE_FORMAT),
				amount: p.amount.to_f / 60,
				description: p.description
				})
		}

		render json: rsp
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

		result = user.cp_contributes.foregin_info.order(date: :desc)

		result = result.start_date(start_date) if start_date
		result = result.end_date(end_date) if end_date

		rsp = []

		# 要這樣做是因為「日期」的格式問題。
		result.each{|p|
			rsp.push(
			{
				id: p.id,
				ref_project_id: p.ref_project_id,
				ref_contributor_id: p.ref_contributor_id,
				date: p.date.strftime(DATE_FORMAT),
				amount: p.amount.to_f / 60,
				description: p.description
				})
		}

		render json: rsp
	end

	def show
	end

	def new
		cte = CPContribute.new()

		cte.ref_contributor_id = current_user().id
		cte.ref_project_id = params[:ref_project_id] if params[:ref_project_id]
		cte.date = params[:date] if params[:date]
		cte.amount = params[:amount].to_f * 60 if params[:amount]
		cte.description = params[:description] if params[:description]

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

		cte.ref_project_id = params[:ref_project_id] if params[:ref_project_id]
		cte.date = params[:date] if params[:date]
		cte.amount = params[:amount].to_f * 60 if params[:amount]
		cte.description = params[:description] if params[:description]

		cte.save()

		puts "真的數字是：#{params[:amount].to_f * 60}"
		render json: {message: 'success', result: cte}
	end

	def delete
		id = params[:id]

		cpc = CPContribute.find(id)
		cpc.destroy

		render json: {message: 'success'}
	end
end
