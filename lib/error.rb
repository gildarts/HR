
class Error
	def initialize(msg, code)
		@_error = {message: msg, code: code}
	end

	attr_accessor :_error
end
