
# What's up darkness?

## Discontinuation Message
__Thank you for everyone who used this application. I am sorry to say that I cannot maintain this anymore. I do not think that it is worth to implement theme settings for new version of theme. I use [ferdi](https://github.com/getferdi/ferdi) from now on.__

## Description
An electron based dark themed WhatsApp Web client.

## Screenshot
![preview](https://image.ibb.co/nhjj49/app.jpg)

## Features
 - Configurable theme
 - Notification support
 - Open Spotify links in Spotify application (Windows only)
 - Auto update (Windows only)
 - <kbd>Control</kbd>+<kbd>F</kbd>: Search on contacts
	 - <kbd>↑</kbd> and <kbd>↓</kbd>: Select contact
 - <kbd>Control</kbd>+<kbd>→</kbd>: Focus chat area
 - <kbd>Control</kbd>+<kbd>Shift</kbd>+<kbd>K</kbd>: Toggle developer tool


## Installation
### From binaries
The precompiled 64bit binaries are available for Windows and Linux at [releases](https://github.com/tncga/whats-up-darkness/releases/latest) page.

### From source
#### With script (Linux only)
`install.sh` automatically installs on /opt/whatsapp and creates desktop shortcut.

	git clone https://github.com/tncga/whats-up-darkness.git
	chmod +x ./install.sh
	./install.sh

#### Manually
	git clone https://github.com/tncga/whats-up-darkness.git
	cd whats-up-darkness
	npm install
	npm run build

Build scripts:
- `npm run build` unpacked
- `npm run dist` tar.xz for linux, NSIS Web for Windows

	
## Thanks
[vednoc for Onyx](https://github.com/vednoc/onyx)

[seriema for electron-notification-shim](https://github.com/seriema/electron-notification-shim)

[PitPik for colorPicker](https://github.com/PitPik/colorPicker)

## License

	MIT License

	Copyright (c) 2018 Gökberk AKDENİZ

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
