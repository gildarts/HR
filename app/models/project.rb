class Project < ActiveRecord::Base
	# To configure a difference table name:
	self.table_name = "project"

	has_many :cp_contributes, nil, {class_name: "CPContribute", foreign_key: "ref_project_id"}
end
