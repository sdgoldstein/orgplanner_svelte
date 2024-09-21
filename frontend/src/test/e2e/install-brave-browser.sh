# FOR LATER.  NOT CURRENTLY USED
# The image of "mcr.microsoft.com/playwright:v1.39.0-jammy"
# is already support the below commands:
# docker run -it mcr.microsoft.com/playwright:v1.39.0-jammy

# https://brave.com/linux/#debian-ubuntu-mint

# already have curl
# apt install curl

curl -fsSLo /usr/share/keyrings/brave-browser-archive-keyring.gpg https://brave-browser-apt-release.s3.brave.com/brave-browser-archive-keyring.gpg

echo "deb [signed-by=/usr/share/keyrings/brave-browser-archive-keyring.gpg] https://brave-browser-apt-release.s3.brave.com/ stable main" | tee /etc/apt/sources.list.d/brave-browser-release.list

apt update -y

apt install brave-browser -y