#!/usr/bin/env ruby
# encoding: utf-8

require 'nokogiri'
require 'open-uri'
require 'redis'
require 'json'

class XKCDScraper
	@@base = 'http://xkcd.com'

	@@redis = nil
	

	def initialize(cache = true)
		if(cache)
			begin
				@@redis = Redis.new
				@@redis.ping
			rescue
				@@redis = nil
			end
		end
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
		rid = rand(1 .. latest['num'])
		return getID(rid)
	end

	def getLatest
		return getData(@@base)
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
		infoUrl = url + '/info.0.json'
		hash = JSON.parse(open(infoUrl).read)
		hash.delete("transcript")
		return hash
	end

	#
	# No longer used
	#
	def scrapeData(url) 
		page = Nokogiri::HTML(open(url))

		id = 0
		comic = nil

		img = page.css('#comic img').first
		alt = img.attr('title').to_s
		img = img.to_s

		title = page.css('#ctitle').text.to_s

		navPrev = page.css('.comicNav a[rel="prev"]').first
		if(navPrev.attr('href') =~ /(\d+)/)
			id = $1.to_i + 1
		else
			id = 1
		end

		return {:alt => alt, :img => img, :num => id, :title => title}
	end
end

xkcdScraper = XKCDScraper.new(true)

if ARGV[0]
	puts "\n\n__Testing comic '#{ARGV[0]}'__\n"
	puts xkcdScraper.fetch(ARGV[0])
end


# puts "\n\n__Testing comic 1__\n"
# p xkcdScraper.fetch(1)

# puts "\n\n__Testing comic random__\n"
# p xkcdScraper.fetch(:random)

# puts "\n\n__Testing comic latest__\n"
# p xkcdScraper.fetch(:latest)