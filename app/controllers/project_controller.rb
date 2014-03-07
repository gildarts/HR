class ProjectController < ApplicationController
	layout false

	after_filter :set_access_control_headers
	
	def index
		render json: Project.all
	end

	def show
	end

	def new
	end

	def edit
	end

	def delete
	end
end
