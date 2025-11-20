# Adobe Utility Scripts
Assorted utility scripts for apps in the Adobe Creative Cloud suite



# Premiere Pro

## BPM Markers

Generates a marker for each beat per minute.

The marker timing is aligned to the clip in-point, not the clip timecode.

Measures can be set with a specified highlight and pattern.



### Installation

1. Download and move the `BPM_Markers` folder to the correct library location:

   - **macOS**: `~/Library/Application Support/Adobe/CEP/extensions/BPM_Markers/`
   - **Windows**: `C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\BPM_Markers\`

2. **Enable debugging mode** (required for unsigned extensions):

   - **macOS**: Run in Terminal:

     ```shell
     defaults write com.adobe.CSXS.12 PlayerDebugMode 1
     ```

   - **Windows**: Create a registry key at `HKEY_CURRENT_USER\Software\Adobe\CSXS.12` with a String value `PlayerDebugMode` set to `1`

3. **Restart Premiere Pro**

4. **Open the panel**: Window → Extensions → BPM Markers
