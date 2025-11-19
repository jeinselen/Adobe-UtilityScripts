/* main.js - CEP panel logic */
(function () {
	'use strict';
	
	function safeLog() {
		try { console.log.apply(console, arguments); } catch (e) {}
	}
	
	// Guard: CSInterface available?
	if (typeof CSInterface === 'undefined') {
		alert("CSInterface.js not found. Make sure ./CSInterface.js is included and referenced from index.html.");
		return;
	}
	
	const cs = new CSInterface();
	
	// Button handler
	const applyBtn = document.getElementById('applyBtn');
	if (!applyBtn) {
		alert("Apply button not found in DOM.");
		return;
	}
	
	applyBtn.addEventListener('click', function () {
		const bpmVal = parseFloat(document.getElementById('bpmInput').value);
		const primaryIndex = parseInt(document.getElementById('primColor').value, 10);
		const accentIndex  = parseInt(document.getElementById('accentColor').value, 10);
		let accentFreq     = parseInt(document.getElementById('accentFreq').value, 10);
		
		if (isNaN(bpmVal) || bpmVal <= 0) {
			alert("Please enter a valid BPM (positive number).");
			return;
		}
		if (isNaN(primaryIndex) || primaryIndex < 0 || primaryIndex > 7 ||
			isNaN(accentIndex)  || accentIndex  < 0 || accentIndex  > 7) {
				alert("Marker color indices must be between 0 and 7.");
				return;
			}
		if (!accentFreq || accentFreq < 1) accentFreq = 1;
		
		// Build a robust evalScript call. Ensure decimal uses '.' to avoid locale issues.
		const bpmStr = bpmVal.toString().replace(',', '.');
		
		const script = `createBPMMarkersOnSelection(${bpmStr}, ${primaryIndex}, ${accentIndex}, ${accentFreq})`;
		safeLog("Evaluating ExtendScript:", script);
		
		cs.evalScript(script, function (res) {
			safeLog("ExtendScript returned:", res);
			// ExtendScript returns strings; try parsing to int
			const n = parseInt(res, 10);
			if (!isNaN(n) && n >= 0) {
				if (n === 0) {
					alert("No markers were added. Make sure a timeline clip is selected.");
				} else {
					alert(`Success: ${n} marker(s) added.`);
				}
			} else {
				// If ExtendScript threw an alert with an error, res may be empty/undefined.
				alert("Finished, but couldn’t parse result. Check the Premiere console (ExtendScript Toolkit log) for details.");
			}
		});
	});
})();