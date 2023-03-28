# img_graph_web
A demo for visualizting image graph on web

## Modules
--index.html: page that renders the graph  
--src/    
  |----parse.js: fetch input files and parse node / edge data  
	|----draw.js: draw the graph  
  
## How to use
With HTTP server on, visit url:
https://[localhost]/?dot_url=[/trevi.dot]&list_url=[/url_list.txt]

Replace the following:
* [localhost] : url to the server
* [/trevi.dot] : url to the dot file 
* [/url_list.txt] : url to the image url list file

A working example: 
http://34.102.61.185/?dot_url=http://34.102.61.185/trevi.dot&list_url=http://34.102.61.185/url_list.txt


