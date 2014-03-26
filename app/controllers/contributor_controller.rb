#
# Contributor
#
class ContributorController < ApplicationController
	layout false

	after_filter :set_access_control_headers

	def index
		render :json => Contributor.all.select('id, name, user_id, unit_cost')
	end

	def show
		rsp = Contributor.find_by_id(params[:id])

		if rsp == nil
			render :json => Error.new(NOT_FOUND, NOT_FOUND_CODE)
			return
		end

		render :json => rsp
	end

	def new
		np = Contributor.new

		np.name = params[:name] if params[:name]
		np.user_id = params[:user_id] if params[:user_id]
		np.unit_cost = params[:unit_cost] if params[:unit_cost]

		np.save

		render :json => {:result => np}
	end

	def edit
		id = params[:id]

		np = Contributor.find_by_id(id)

		if np == nil
			render :json => Error.new(NOT_FOUND, NOT_FOUND_CODE)
			return
		end

		np.name = params[:name] if params[:name]
		np.user_id = params[:user_id] if params[:user_id]
		np.unit_cost = params[:unit_cost] if params[:unit_cost]

		np.save

		render :json => {:result => np}
	end

	def delete
		id = params[:id]

		cpc = Contributor.find_by_id(id)

		if cpc == nil
			render :json => Error.new(NOT_FOUND, NOT_FOUND_CODE)
			return
		end

		cpc = cpc.destroy

		render :json => {:message => 'success', :origin_object => cpc}
	end

	# 取得最近的工作時數。
	def last_summary
	    # [{
	    #     "date": "2014-03-05",
	    #     "amount_sum": 16
	    # }, {
	    #     "date": "2014-03-04",
	    #     "amount_sum": 2
	    # }]

	    user  = current_user

	    if user.has_attribute?('_error')
	    	render :json => user._error
	    	return
	    end

	    day_count = params[:count]

	    puts 'day count' + day_count.inspect

	    result = CPContribute.find_by_sql([
	    	'select date,sum(amount) amount_sum
	    	from cp_contribute
	    	where ref_contributor_id=?
	    	group by date
	    	order by date desc
	    	limit ?',
	    	user.id, day_count
	    	])

	    #puts result.inspect

	    rsp = []
	    result.each{| each |
	    	rsp.push({
	    		:date => each.date.strftime(DATE_FORMAT),
	    		:amount_sum => each.amount_sum.to_f / 60
	    		})
	    }
	    render :json => rsp
	  end
	end