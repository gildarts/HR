#
# Project
#
class ProjectController < ApplicationController
	layout false

	after_filter :set_access_control_headers

	def index
		render json: Project.all.select("id, ref_contributor_id, name, description").order(created_at: :desc)
	end

	def show
		rsp = Project.find_by_id(params[:id])

		if(!rsp)
			render json: Error.new(NOT_FOUND, NOT_FOUND_CODE)
			return
		end

		render json: rsp
	end

	def new
		np = Project.new()

		np.ref_contributor_id = params[:ref_contributor_id] if params[:ref_contributor_id]
		np.name = params[:name] if params[:name]
		np.description = params[:description] if params[:description]

		np.save

		render json: {result: np}
	end

	#缺少參數是會把資料更新為空白的。
	def edit
		id = params[:id]
		p = Project.find_by_id(id)

		if(!p)
			render json: Error.new(NOT_FOUND, NOT_FOUND_CODE)
			return
		end

		p.ref_contributor_id = params[:ref_contributor_id] if params[:ref_contributor_id]
		p.name =  params[:name] if  params[:name]
		p.description = params[:description] if params[:description]

		p.save

		render json: {result: p}
	end

	def delete
		id = params[:id]

		cpc = Project.find_by_id(id)

		if(!cpc)
			render json: Error.new(NOT_FOUND, NOT_FOUND_CODE)
			return
		end

		cpc = cpc.destroy

		render json: {message: 'success', origin_object: cpc}
	end
end
