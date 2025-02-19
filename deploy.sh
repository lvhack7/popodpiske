#!/bin/bash

echo "Pulling latest changes from Git..."
git pull

echo "Installing dependencies..."
npm install

echo "Building the project..."
npm run build

echo "Done!"