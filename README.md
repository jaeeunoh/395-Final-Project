## CSC395 Final Project - Fashion Network

### Members: JaeEun Oh, Trang Nguyen, Linh Pham

This project visualizes the relationship between 167 clothing categories and 6 important annual fashion events globally. We used data from Google Trend API, retrieved using Python 2 code. The dataset records the popularity of the clothing item and fashion event weekly from Jan 2012 to Dec 2016.

There are 3 main components of this visualization. The first component is the timeline from 2012 to 2016. We created 3 buttons - play, pause and stop, in order to let the user observe the change of network over time. We also let user choose the speed of the slider.

The second component is the network containing 167 nodes and more than 800 edges. Since the number of nodes is large, we decided not to use simulation force since it takes a lot of time to restart the simulation whenever the user drags or clicks on the node. Instead, we recorded the position x and y of each node and make them static. Additionally, we created the feature multiple search to enable users select one or more categories they want to look at specifically. This feature will highlight only items the users search. The reset button will bring back the original network.

The last component of this visualization is the information about each node in the network. Whenever user clicks on any node, the image of that item will show up to help user gain more information and avoid any confusion from fashion jargon.

##### Description of files:
fashion.js: contains main js code base
fashion.html: generates basic components of the page
style.css: contains styling for different elements of the page
node_list.csv: file containing node list
edge_list.csv: file containing edges
node_url.csv: file containing url for images of all nodes
pic/...: contain pictures created for the events
wiki: file containing url to wiki pages of the events
.ipyno: python code for getting the data


##### Citations: 
*http://www.coppelia.io/2014/07/an-a-to-z-of-extra-features-for-the-d3-force-layout/* for autocompletion and highlight function
*http://jsfiddle.net/phpdeveloperrahul/zMWLx/* for multiple selection box
*http://stackoverflow.com/questions/12080098/dropdown-using-javascript-onchange* for dropdown menu
