# Deployment directory
DEST=/var/www/classapps/static/ipv4explore

deploy: index.html main.js main.css iana-ipv4-special-registry.js ipv4-explore.js iana-registry.js
	cp index.html $(DEST)
	cp main.css $(DEST)
	cp main.js $(DEST)
	cp iana-ipv4-special-registry.js $(DEST)
	cp ipv4-explore.js $(DEST)
	cp iana-registry.js $(DEST)
