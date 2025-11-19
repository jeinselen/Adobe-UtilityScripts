#target premierepro

function createBPMMarkersOnSelection(bpm, primaryColorIndex, accentColorIndex, accentFrequency) {
	try {
		if (!app.project || !app.project.activeSequence) {
			alert("No active sequence. Please open a sequence in Premiere Pro.");
			return 0;
		}
		var seq = app.project.activeSequence;
		var selection = seq.getSelection();  // get selected clip(s) [oai_citation:10‡ppro-scripting.docsforadobe.dev](https://ppro-scripting.docsforadobe.dev/sequence/sequence/#:~:text=An%20array%20of%20Track%20item,the%20sequence%2C%20in%20temporal%20order)
		if (!selection || selection.length === 0) {
			alert("No clip selected. Please select a clip in the timeline.");
			return 0;
		}
		var totalMarkers = 0;
		// Loop through each selected clip (track item)
		for (var i = 0; i < selection.length; i++) {
			var trackItem = selection[i];
			if (!trackItem.projectItem) {
				continue; // skip if no underlying project item (should not happen for normal clips)
			}
			var projItem = trackItem.projectItem;                  // underlying ProjectItem [oai_citation:11‡ppro-scripting.docsforadobe.dev](https://ppro-scripting.docsforadobe.dev/item/trackitem/#:~:text=TrackItem)
			var markers = projItem.getMarkers();                   // MarkerCollection for the clip
			var inSec = trackItem.inPoint.seconds;                 // clip's source in-point in seconds
			var outSec = trackItem.outPoint.seconds;               // clip's source out-point in seconds
			var durationSec = trackItem.duration.seconds;          // duration of the clip selection in seconds
			if (durationSec <= 0) {
				continue;
			}
			var interval = 60.0 / bpm;  // beat interval in seconds
			var beatIndex = 0;
			for (var t = 0.0; t < durationSec; t += interval) {
				var markerTime = inSec + t;
				if (markerTime >= outSec) break;  // stop if beyond clip
				beatIndex++;
				var newMarker = markers.createMarker(markerTime);  // add marker at time (seconds) [oai_citation:12‡ppro-scripting.docsforadobe.dev](https://ppro-scripting.docsforadobe.dev/collection/markercollection/#:~:text=MarkerCollection)
				// Set marker color: accent on every Nth beat
				if (accentFrequency > 0 && (beatIndex % accentFrequency === 0)) {
					newMarker.setColorByIndex(accentColorIndex);
				} else {
					newMarker.setColorByIndex(primaryColorIndex);
				}
			}
			totalMarkers += beatIndex;
		}
		return totalMarkers;  // return the count of markers added
	} catch (e) {
		alert("Error creating BPM markers: " + e);
		return 0;
	}
}