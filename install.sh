#!/usr/bin/sh
set -e
trap 'echo -e "\e[31mAn error occured. Exiting...\e[0m"' ERR


FILE="/home/$(logname)/.local/share/applications/whatsapp.desktop"
CONTENT="""[Desktop Entry]
Type=Application
Encoding=UTF-8
Name=WhatsApp
Comment=A WhatsApp client
Exec=/opt/whatsapp/wupd
Icon=/opt/whatsapp/resources/assets/img/icon-linux.png
Terminal=false"""

if [ ! -x "$(command -v npm)" ]; then
    echo -e "\e[31mERROR: npm is required but not found!\e[0m" 1>&2
    exit 1
fi

if [ ! -e node_modules/ ]; then
    echo -e "\e[1;34m[0/4]\e[0m \e[94mInstalling dependencies...\e[0m"
    npm install 1>/dev/null
fi

echo -e "\e[1;34m[1/4]\e[0m \e[94mBuilding...\e[0m"
sudo -u $USER npm run build 1>/dev/null

echo -e "\e[1;34m[2/4]\e[0m \e[94mOld installation removing...\e[0m"
sudo rm -rf /opt/whatsapp/

echo -e "\e[1;34m[3/4]\e[0m \e[94mInstalling (/opt/whatsapp)...\e[0m"
sudo mv dist/linux-unpacked/ /opt/whatsapp/

if [ ! -f "$FILE" ]; then
    echo -e "\e[1;34m[4/4]\e[0m \e[94mCreating desktop file...\e[0m"
    echo "$CONTENT" > "$FILE"
else
    echo -e "\e[1;34m[4/4]\e[0m \e[94mDesktop file already exist...\e[0m"  
fi

if [ ! "$(find "release-builds/" -mindepth 1 -print -quit 2>/dev/null)" ]; then
    rm -r dist/
fi

echo -e "\n\e[1;34mFinished\e[0m"
