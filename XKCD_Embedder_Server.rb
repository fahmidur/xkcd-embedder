#!/usr/bin/env ruby

$:.push('.')

require 'sinatra'
require 'nokogiri'
require 'open-uri'
require 'XKCDScraper.rb'


xkcd = XKCDScraper.new


get "/random" do
	return xkcd.fetch('random')
end

get '/:id' do
	content_type :json
	return xkcd.fetch(params[:id])
end