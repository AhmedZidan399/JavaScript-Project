ecommerce-amazon-final.zip - Final project (uses Unsplash Source to fetch full-HD images)

What this archive contains:
- index.html, product.html, cart.html (Amazon-style demo)
- assets/js/, assets/css/, products.json (24 products)
- assets/img/ (currently placeholders or earlier images)
- download_images.sh -> Bash script that will download 25 full-HD images from Unsplash Source into assets/img/

IMPORTANT:
- Unsplash Source (https://source.unsplash.com) returns random images matching the query.
  The script will fetch high-resolution images (1920x1080) for queries such as 'iphone', 'sneakers', 'coffee', etc.
- To populate the project with full-HD real images, run the script locally in the project folder:
    ./download_images.sh
  or
    bash download_images.sh
- The script requires curl to be installed and an internet connection.
- After running, open index.html in your browser (or run a simple HTTP server if needed):
    python -m http.server 5500
    # then go to http://localhost:5500

Notes on authenticity & licensing:
- Images are fetched directly from Unsplash Source which serves images from Unsplash. They are free to use, but please review Unsplash licensing if you plan to publish commercially.

If you want me to pre-download and embed exact static image files into the ZIP for you, I can't fetch external files directly into this ZIP from here — but the download script above will do it in one command on your machine and produce the full-HD images inside the project.
