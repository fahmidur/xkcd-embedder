#!/usr/bin/env ruby

require 'open-uri'
require 'json'

f = File.open('listing2.txt', 'w')
limit = 1936
(1..limit).each do |n|
	begin
    f.puts open("https://xkcd.com/#{n}/info.0.json").read, "\n"
    printf("%04d / %04d\n", n, limit)
	rescue => err
    printf("%04d / %04d\t[FAILED] ERR = #{err}\n", n, limit)
	end
  #sleep(1)
  #break
end
f.close
