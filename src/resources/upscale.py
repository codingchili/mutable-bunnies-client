from PIL import Image
from PIL import ImageFilter
from math import trunc
import shutil
import os
import time

"""
 Script that takes an input icon sheet, splits each icon into a new image
 and then applies upscaling from 32x32 to 128x128 with a pixelated look.
 
 it unpacks sprite sheets, useful for icons as its much more convenient
 to map to filenames rather than coordinates in a sprite grid.
 
 requires `pip install pillow`
"""

# number of pixels to upscale from.
PIXELS = 1
TARGET_SIZE = (128, 128)
ICON_SIZE = 24


def source(image):
    return Image.open(r"{}".format(image))


def upscale(image):
    width, height = image.size  # target original size.
    image = image.resize((width // PIXELS, height // PIXELS), Image.NEAREST)

    width, height = TARGET_SIZE  # target upscaled size
    return image.resize((width * PIXELS, height * PIXELS), Image.NEAREST)


def sharpen(image):
    return image.filter(ImageFilter.SHARPEN)


def has_pixels(image):
    image.convert("RGBA")
    pixels = image.getdata()
    for pixel in pixels:
        if pixel[3] > 0:
            return True
    return False


def color_filter(image):
    width, height = image.size
    pixels = image.load()

    for x in range(0, width):
        for y in range(0, height):
            r, g, b, a = image.getpixel((x, y))
            if r > 100 and b > 100 and g > 100:
                pixels[x, y] = (int(min(r + 80, 240)), int(b * 0.6), int(g * 0.6), a)
    return image


def split(image):
    # if all pixels in icon is transparent, filter it.
    width, height = image.size
    icons = []

    for row in range(0, height // ICON_SIZE):
        for column in range(0, width // ICON_SIZE):
            x = column * ICON_SIZE
            y = row * ICON_SIZE
            icon = image.crop((x, y, x + ICON_SIZE, y + ICON_SIZE))

            if has_pixels(icon):
                icons.append(icon)

    return icons


def process_icons(input, output, size):
    global ICON_SIZE
    ICON_SIZE = size

    print("\nprocessing icon sheet\n\t{} -> {} ..".format(input, output))

    if os.path.exists(output):
        shutil.rmtree(output)
    os.makedirs(output)

    start = time.time()
    image = source(input)
    icons = split(image)
    print("\n\tprocessing {} icons..".format(len(icons)))

    for id, icon in enumerate(icons):
        scaled = icon
        #scaled = color_filter(scaled)
        scaled = upscale(scaled)
        scaled = sharpen(scaled)
        scaled.save("{}/icon_{}.png".format(output, id))

        if id % (len(icons) // 10) == 0:
            percent = trunc((id / len(icons)) * 100)
            print("\t\t{}% complete..".format(percent))

    print("\n\tCompleted in {}s.".format(round(time.time() - start, 2)))


process_icons("raw/icons/swords_24.png", "raw/icons/out/swords", 24)
process_icons("raw/icons/iconset_1_shadow_32.png", "raw/icons/out/plain", 32)
