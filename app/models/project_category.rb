class ProjectCategory < ActiveRecord::Base
	# To configure a difference table name:
	self.table_name = "project_category"

	has_many :projects, nil, {class_name: "Project", foreign_key: "ref_category_id"}
end
