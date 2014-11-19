#
# Project Category
#
class ProjectcategoryController < ApplicationController
	layout false

	before_filter :check_session

	def index
		render json: ProjectCategory.all
	end

	def show
		rsp = ProjectCategory.find_by_id(params[:id])

		if(!rsp)
			render json: Error.new(NOT_FOUND, NOT_FOUND_CODE)
			return
		end

		render json: rsp
	end

	def new
		np = ProjectCategory.new()

		np.name = params[:name] if params[:name]
		np.description = params[:description] if params[:description]

		np.save

		render json: {result: np}
	end

	#缺少參數是會把資料更新為空白的。
	def edit
		id = params[:id]
		p = ProjectCategory.find_by_id(id)

		if(!p)
			render json: Error.new(NOT_FOUND, NOT_FOUND_CODE)
			return
		end

		p.name =  params[:name] if  params[:name]
		p.description = params[:description] if params[:description]

		p.save

		render json: {result: p}
	end

	def delete
		id = params[:id]

		cpc = ProjectCategory.find_by_id(id)

		if(!cpc)
			render json: Error.new(NOT_FOUND, NOT_FOUND_CODE)
			return
		end

		cpc = cpc.destroy

		render json: {message: 'success', origin_object: cpc}
	end
end
