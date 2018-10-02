import setuptools

with open("README.md", "r") as fh:
    long_description = fh.read()

setuptools.setup(
    name="intersight-rest",
    version="1.1.7",
    author="Matthew Garrett",
    author_email="matgarre@cisco.com",
    py_modules=['intersight_rest',],
    description="Cisco Intersight Python REST Module",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/CiscoUcs/intersight-rest",
    packages=setuptools.find_packages(),
    install_requires=[
        'six >= 1.11.0',
        'pycryptodome >= 3.6.4',
        'pycryptodomex >= 3.6.4',
        'requests >= 2.18.4'
    ],
    classifiers=[
        "Programming Language :: Python :: 3",
        "Operating System :: OS Independent",
    ]
)
