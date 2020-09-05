
# IMPS
from PIL import Image
from PIL import ImageFilter

# Opens a image in RGB mode
image = Image.open(r"./gui/item/icon/apple_green.png")

# Size of the image in pixels (size of orginal image)
# (This is not mandatory)
width, height = image.size
pixel_size = 1

# Setting the points for cropped image
#left = 4
#top = height / 5
#right = 154
#bottom = 3 * height / 5

# Cropped image of above dimension
# (It will not change orginal image)
#im1 = im.crop((left, top, right, bottom))
newsize = (128, 128)


image = image.resize(
    (width // pixel_size, height // pixel_size),
    Image.NEAREST
)
image = image.resize(
    (newsize[0] * pixel_size, newsize[1] * pixel_size),
    Image.NEAREST
)

image = image.filter(ImageFilter.SHARPEN)

# Shows the image in image viewer
image.save("./gui/item/icon/apple_green_co.png")
image.show()