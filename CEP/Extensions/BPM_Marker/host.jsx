#target premierepro

function createBPMMarkersOnSelection(bpm, primaryColorIndex, accentColorIndex, accentFrequency) {
	try {
		if (!app.project || !app.project.activeSequence) {
			alert("No active sequence. Please open a sequence in Premiere Pro.");
			return 0;
		}
		var seq = app.project.activeSequence;
		var selection = seq.getSelection();
		if (!selection || selection.length === 0) {
			alert("No clip selected. Please select a clip in the timeline.");
			return 0;
		}
		var totalMarkers = 0;
		var failedMarkers = 0;
		var failedColors = 0;

		// Loop through each selected clip (track item)
		for (var i = 0; i < selection.length; i++) {
			var trackItem = selection[i];
			if (!trackItem.projectItem) {
				continue;
			}
			var projItem = trackItem.projectItem;
			var markers = projItem.getMarkers();
			var inSec = trackItem.inPoint.seconds;
			var outSec = trackItem.outPoint.seconds;
			var durationSec = trackItem.duration.seconds;

			if (durationSec <= 0) {
				continue;
			}

			var interval = 60.0 / bpm;
			var numBeats = Math.floor(durationSec / interval);

			for (var beatNum = 0; beatNum < numBeats; beatNum++) {
				// Calculate marker time directly from beat number to avoid accumulation error
				var markerTime = inSec + (beatNum * interval);

				// Safety check: ensure we don't exceed the clip boundary
				if (markerTime >= outSec) break;

				// Determine which color to use (1-based beat index)
				var beatIndex = beatNum + 1;
				var colorIndex = primaryColorIndex;
				if (accentFrequency > 0 && (beatIndex % accentFrequency === 0)) {
					colorIndex = accentColorIndex;
				}

				// Create marker
				var newMarker = null;
				try {
					newMarker = markers.createMarker(markerTime);
				} catch (markerError) {
					failedMarkers++;
					continue;
				}

				// Verify marker was created
				if (!newMarker) {
					failedMarkers++;
					continue;
				}

				// Count successful creation
				totalMarkers++;

				// CRITICAL: Retrieve the marker from the collection to ensure we have a valid reference
				// The marker returned by createMarker might not be fully initialized
				var markerFromCollection = null;
				try {
					// Get the marker we just created by finding it at the exact time
					var numMarkersInCollection = markers.numMarkers;
					for (var m = 0; m < numMarkersInCollection; m++) {
						var testMarker = markers[m];
						if (testMarker && Math.abs(testMarker.start.seconds - markerTime) < 0.001) {
							markerFromCollection = testMarker;
							break;
						}
					}
				} catch (retrieveError) {
					// If we can't retrieve it, try using the original reference
					markerFromCollection = newMarker;
				}

				// Use the retrieved marker (or fallback to original if retrieval failed)
				var markerToModify = markerFromCollection ? markerFromCollection : newMarker;

				// Set marker properties to ensure it's fully initialized
				try {
					markerToModify.name = "Beat " + beatIndex;
					markerToModify.comments = "";
				} catch (propError) {
					// Continue even if properties can't be set
				}

				// Set the color with multiple fallback attempts
				var colorSetSuccess = false;

				// Attempt 1: Direct color setting
				try {
					markerToModify.setColorByIndex(colorIndex);
					colorSetSuccess = true;
				} catch (colorError1) {

					// Attempt 2: Set type first, then color
					try {
						markerToModify.type = "Comment";
						markerToModify.setColorByIndex(colorIndex);
						colorSetSuccess = true;
					} catch (colorError2) {

						// Attempt 3: Try with original marker reference if we were using retrieved one
						if (markerFromCollection && markerFromCollection !== newMarker) {
							try {
								newMarker.setColorByIndex(colorIndex);
								colorSetSuccess = true;
							} catch (colorError3) {
								// All attempts failed
								failedColors++;
							}
						} else {
							failedColors++;
						}
					}
				}
			}
		}

		// Report results
		if (failedMarkers > 0 || failedColors > 0) {
			var errorMsg = "Completed with issues:\n";
			errorMsg += totalMarkers + " marker(s) created successfully.\n";
			if (failedMarkers > 0) {
				errorMsg += failedMarkers + " marker(s) failed to create.\n";
			}
			if (failedColors > 0) {
				errorMsg += failedColors + " marker color(s) failed to set.\n";
				errorMsg += "(These markers may appear as default green)\n";
			}
			alert(errorMsg);
		}

		return totalMarkers;
	} catch (e) {
		alert("Error creating BPM markers: " + e.toString() + "\nLine: " + (e.line || "unknown"));
		return 0;
	}
}
