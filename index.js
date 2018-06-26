function find_super(data, ip) {
    var flag = false;
    var ipt = new ipa.Address4(data['Address Block'][0]);
    flag = ip.isInSubnet(ipt) || flag;
    if (data['Address Block'].length == 2) {
	ipt = new ipa.Address4(data['Address Block'][1]);
	flag = ip.isInSubnet(ipt) || flag;
    }
    return(flag);
}

function highlight_net(binstr, prefix) {
    /* highlights characters in binstr according to prefix
       (assumed to be a prefix length)
     */
    b = binstr.split("");
    out = b.map(function(bit, idx) {
        if ((idx != 31) && ((idx + 1) % 8 == 0)) {
            dot = ".";
        } else {
            dot = "";
        }
        if (idx < prefix) {
            return ("<span class='highlight'>" + bit + "</span>" + dot);
        } else {
            return (bit + dot);
        }
    }).join("");
    return (out);
}


function bin_to_dot_dec(s) {
    /* returns a dotted decimal representation form
       of input binary string s.
     */
    s = dot_bin(s);
    var b = s.split(".");
    d = b.map(function(oct, idx) {
        return (parseInt(oct, 2).toString())
    });
    return (d.join("."));
}

function prefix_mask(p) {
    /* returns a binary string with p leading 1's
       and 32-p trailing 0's.
     */
    return ("1".repeat(p) + "0".repeat(32 - p));
}

function pad_bits(s) {
    /* prepends string s with n-s.length 0's*/
    return ("0".repeat(32 - s.length) + s);
}

function dot_bin(s) {
    /* returns a dotted binary version of s */
    return (s.match(/.{1,8}/g).join("."));
}

function explore() {
    var render_additional = true;
    var input_dec = $('#input-dec')[0].value;
    var ip = new ipa.Address4(input_dec);
    var prefix = ip.subnetMask;
    var ip_bits = ip.getBitsBase2();
    var out_bits = highlight_net(ip_bits, prefix);

    /* ip-address.js calls the network address the first
       or start address
     */
    var net_dec = ip.startAddress().address;
    var net_bits = ip.startAddress().getBitsBase2();

    /* Find the parent supernet in the IANA data */
    var supernet = iana_data.filter(function(data) { return find_super(data,ip)});
    if (supernet.length == 2) {
	/* The only overlapping blocks in the data are for 192.168.0.0/16 and
	   the NAT64 discovery addresses
	 */
	supernet = supernet[1];
    }
    else {
	supernet = supernet[0];
    }

    s = "";

    for(x in supernet) {
	s += x + " : " + supernet[x] + "<br>";
    }

    /* Rendering Section */
    $('#iana-data')[0].innerHTML = s;
    $('#user-dec')[0].innerText = ip.addressMinusSuffix;
    $('#user-bin')[0].innerHTML = out_bits;

    /* Handle special cases where broadcast, network, first and last
       aren't applicable.
     */
    if (supernet.Source == 'False') { render_additional = false}


    if (render_additional) {

	$('#user-subnet')[0].innerText = bin_to_dot_dec(prefix_mask(prefix));
	$('#user-subnet-bin')[0].innerHTML = highlight_net(prefix_mask(prefix),prefix);

	/* Get first address from network address */
	first_int = parseInt(net_bits, 2) + 1;
	first_bits = pad_bits(first_int.toString(2));
	first_dec = bin_to_dot_dec(first_bits);

	/* Get the broadcast address ip-address.js calls this the
	   last address.
	 */
	bcast_dec = ip.endAddress().address;
	bcast_bits = ip.endAddress().getBitsBase2();

	/* Get the last usable address from the broacast address */
	last_int = parseInt(bcast_bits, 2) - 1;
	last_bits = pad_bits(last_int.toString(2));
	last_dec = bin_to_dot_dec(last_bits);

	var tmpl = $("#ipv4-address")[0].content.cloneNode(true);
	tmpl.querySelector(".description").innerText = "Network Address";
	tmpl.querySelector(".dotted-decimal").innerText = net_dec;
	tmpl.querySelector(".dotted-binary").innerHTML = highlight_net(net_bits, prefix);
	tmpl.querySelector(".comment").innerText = "All host bits are zero."
	$("#output-container")[0].appendChild(tmpl);

	var tmpl = $("#ipv4-address")[0].content.cloneNode(true);
	tmpl.querySelector(".description").innerText = "First usable address";
	tmpl.querySelector(".dotted-decimal").innerText = first_dec;
	tmpl.querySelector(".dotted-binary").innerHTML = highlight_net(first_bits, prefix);
	tmpl.querySelector(".comment").innerText = "Equal to the network address plus 1."
	$("#output-container")[0].appendChild(tmpl);

	var tmpl = $("#ipv4-address")[0].content.cloneNode(true);
	tmpl.querySelector(".description").innerText = "Last usable address";
	tmpl.querySelector(".dotted-decimal").innerText = last_dec;
	tmpl.querySelector(".dotted-binary").innerHTML = highlight_net(last_bits, prefix);
	tmpl.querySelector(".comment").innerText = "Equal to the broadcast address minus 1."
	$("#output-container")[0].appendChild(tmpl);

	var tmpl = $("#ipv4-address")[0].content.cloneNode(true);
	tmpl.querySelector(".description").innerText = "Broadcast address";
	tmpl.querySelector(".dotted-decimal").innerText = bcast_dec;
	tmpl.querySelector(".dotted-binary").innerHTML = highlight_net(bcast_bits, prefix);
	tmpl.querySelector(".comment").innerText = "All host bits are 1."
	$("#output-container")[0].appendChild(tmpl);
    }
    else {
	$('#user-subnet')[0].innerText = "N/A";
	$('#user-subnet-bin')[0].innerText = "N/A";
	$("#output-container").append("<br><em>No futher information to display here.</em><br><br>")
    }
}
