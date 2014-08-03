#!/usr/bin/env ruby

require 'open-uri'
require 'json'

f = File.open('listing.txt', 'w')
limit = 1401
(403..limit).each do |n|
	# data = JSON.parse(open("http://xkcd.com/#{n}/info.0.json").read)

	begin
	f.puts open("http://xkcd.com/#{n}/info.0.json").read, "\n"
	printf("%04d / %04d\n", n, limit)
	rescue
	printf("%04d / %04d\t[FAILED]\n", n, limit)
	end
	# sleep(1)
	# break
end
f.close