require_relative 'XKCDScraper'
require 'test/unit'
require 'json'



class TestXKCDScraper_Cache < Test::Unit::TestCase
	def setup
		# Create new XKCDScraper without a Redis cache
		@xkcdScraper = XKCDScraper.new(false)
		@fetchCount = 0
	end

	def testFixed
		max = 1
		(1..max).each do |num|
			fetch(num)
			printRet
			assert_equal(num, @ret['num'])
			sleep 1 if max > 1
		end
	end

	def testRandom
		fetch('random')
		printRet
		assert(@ret['num'] && @ret['num'] != 0, "fetch('random') WORKS")
	end

	def testLatest
		fetch('latest')
		printRet
		assert(@ret['num'] && @ret['num'] != 0, "fetch('random') WORKS")
	end

	private

	def fetch(x)
		@ret = @xkcdScraper.fetch(x)
		@ret = JSON.parse(@ret) if @ret.class == String
		@fetchCount += 1
	end

	def printRet
		puts "\n\n#{@fetchCount})\t#{@ret.inspect}\n--------------\n\n"
		
	end
end