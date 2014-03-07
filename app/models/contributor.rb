class Contributor < ActiveRecord::Base
	# To configure a difference table name:
	self.table_name = "contributor"

	has_many :cp_contributes, nil, {class_name: "CPContribute", foreign_key: "ref_contributor_id", dependent: :destroy}
end
