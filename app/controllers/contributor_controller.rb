
class ContributorController < ApplicationController
	layout false

	after_filter :set_access_control_headers

	def index
		render json: Contributor.all
	end

	def show
	end

	def new
	end

	def edit
	end

	def delete
	end

	def current
		render json: current_user()
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

	    user  = current_user()

	    if user.has_attribute?('_error')
	    	render json: user._error
	    	return
	    end

	    day_count = params[:count]

	    result = CPContribute.find_by_sql([
	    	'select date,sum(amount) amount_sum
	    	from cp_contribute
	    	where ref_contributor_id=?
	    	group by date
	    	order by date desc
	    	limit ?',
	    	user.id, day_count
	    	])

	    rsp = []
	    result.each{| each |
	    	rsp.push({
	    		date: each.date.strftime(DATE_FORMAT),
	    		amount_sum: each.amount_sum
	    		})
	    }
	    render json: rsp
	  end
	end