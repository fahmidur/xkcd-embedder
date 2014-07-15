#!/usr/bin/env ruby

require 'nokogiri'
require 'open-uri'
require 'redis'
require 'json'

class XKCDScraper
	@@base = 'http://xkcd.com'

	@@redis = nil
	begin
		@@redis = Redis.new
		@@redis.ping
	rescue
		@@redis = nil
	end

	def initialize
	end

	# takes id, random, latest
	def fetch(string)
		string = string.to_s
		if string =~ /^\d+$/
			return getID(string.to_i)
		elsif string == "random"
			return getRandom()
		elsif string == "latest"
			return getLatest()
		end
	end

	def getRandom
		latest = getLatest()
		rid = rand(1 .. latest[:id])
		return getID(rid)
	end

	def getLatest
		getData(@@base)
	end

	def getID(id)
		id = id.to_s
		return {:error => 'Invalid ID'} unless id =~ /^\d+$/


		cacheKey = nil
		cached = nil

		if @@redis
			cacheKey = "XKCDScraper:#{id}"
			cached = @@redis.get(cacheKey)
		end

		if cached
			return cached
		end

		data = getData(@@base + "/#{id}")
		dataJSON = data.to_json

		if @@redis
			@@redis.set cacheKey, dataJSON
		end

		return dataJSON
	end

	private

	def getData(url)
		page = Nokogiri::HTML(open(url))

		id = 0
		title = nil
		comic = nil

		page.css('#comic img').each do |img|
			comic = img.attr('src').to_s
			title = img.attr('title').to_s
			break
		end

		page.css('.comicNav a[rel="prev"]').each do |prev|
			href = prev.attr('href')
			if(href =~ /(\d+)/)
				id = $1.to_i + 1
			else
				id = 1
			end
			break
		end

		return {:title => title, :comic => comic, :id => id}
	end
end

xkcdScraper = XKCDScraper.new

# puts "\n\n__Testing comic 1__\n"
# p xkcdScraper.fetch(1)

puts "\n\n__Testing comic 338__\n"
p xkcdScraper.fetch(338)

# puts "\n\n__Testing comic random__\n"
# p xkcdScraper.fetch(:random)

# puts "\n\n__Testing comic latest__\n"
# p xkcdScraper.fetch(:latest)