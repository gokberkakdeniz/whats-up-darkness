
# What's up darkness?
> Unofficial basic WhatsApp client with dark [Onyx](https://github.com/vednoc/onyx) theme

## Preview
![preview](https://image.ibb.co/b6xo09/app.jpg)

## Features
 - Tray Icon:
   - Show
   - Toggle dev tools
   - Configure themes
   - Quit
 - Double/single (Windows/Linux) clicking the tray icon toggles the main window
 - Close button hides the window
 - Flash frame when there is a notification (the main window shouldn't be hidden)
 - Notification support (except Windows)
 - <kbd>Control</kbd>+<kbd>F</kbd>: Search on contacts
 - <kbd>Control</kbd>+<kbd>←</kbd>: Focus contact area
	 - <kbd>↑</kbd> and <kbd>↓</kbd>: Select contact
 - <kbd>Control</kbd>+<kbd>→</kbd>: Focus chat area
 - <kbd>Control</kbd>+<kbd>Shift</kbd>+<kbd>K</kbd>: Toggle developer tool
 - Check app and theme version


### Notes
> The window will not be shown in order to hide an uninjected page until the web site is loaded.

## Build
    git clone https://github.com/tncga/whats-up-darkness.git
    cd whats-up-darkness
    npm install
    npm install electron-packager -g
    npm run build:linux-x64

Build scripts:
>    npm run build:linux-ia32

>    npm run build:linux-x64

>    npm run build:win-ia32

>    npm run build:win-x64


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
