# Linkedin Company Information Scraping Bot

The goal of this project is to automatically populate a table with the information that can be found on public company Linkedin profiles.
Given a list of Linkedin company profile, the bot will navigate and collect the information available before exporting the result in a CSV file.

The bot is based on Puppeteer for nodeJS that allows this script to open and control a Headless Chrome Web Browser.

Information collected: name|employeesOnLinkedin|blurb|Website|Industry|Company size|Headquarters|Type|Founded|Specialties

This script works in April 2019 on a US interface but might not work anymore as the websites's front-end evolve in the future.

## Getting Started

The input file is a CSV (whose rows are delimited by ";"). 
It contains the list of the company profiles URLs on Linkedin. 
An exemple of this library can be found in the input.csv file.

You can see an exemple of result by opening the "result" file.

### Prerequisites

The project requieres a functional NodeJS environment.

### Installing

To install the node libraries: 
* npm i puppeteer
* npm i prompt
* npm i fast-csv

## Start

node index.js

The output CSV file uses "|" separator to not interfere with the content, using the convert columns to rows on excel allows good readability.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Disclaimer

This script has been published as a technical demonstration and shouldn't be used against the terms of service of any website or for any other harmful purpose.