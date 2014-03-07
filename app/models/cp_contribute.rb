class CPContribute < ActiveRecord::Base
	# To configure a difference table name:
	self.table_name = "cp_contribute"

	belongs_to :contributor, nil, {class_name: "Contributor", foreign_key: "ref_contributor_id"}

	belongs_to :project, nil, {class_name: "Project", foreign_key: "ref_project_id"}

	# 預設會將 Foreign Table 的重要資訊回傳。
	scope :foregin_info, -> {
		fields = 'cp_contribute.*','contributor.user_id, contributor.name user_name'
		return select(fields).joins(:contributor).joins(:project).order(date: :desc,created_at: :desc)
	}

	# 可條件過慮日期區間。
	scope :between_date, ->(start_date, end_date) {
		where(['date>=? and date<=?', start_date, end_date])
	}

	# 可條件過慮日期區間。
	scope :start_date, ->(start_date) {
		where(['date>=?', start_date])
	}

	# 可條件過慮日期區間。
	scope :end_date, ->(end_date) {
		where(['date<=?', end_date])
	}
end
