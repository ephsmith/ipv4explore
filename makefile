# Deployment directory
DEST=/var/www/classapps/static/ipv4explore

deploy: index.html main.js main.css
	cp index.html $(DEST)
	cp shorten.php $(DEST)
	cp main.css $(DEST)
	cp main.js $(DEST)
