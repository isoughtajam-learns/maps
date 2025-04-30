# maps

## Versions (past and planned)

### v0.1.0 MVP
- Basic authentication
- CRUD operations on map markers
- markdown marker description renderer

### v0.2.0 Search
- Add location search bar to map

### v0.3.0 Personalization
- Add author comments to map
  - separate author comments for markers
- save map at URL
- save map at custom URL

### v0.4.0 Rich Content
- Rich text editor in marker form
- Rich text renderer in popups
- Image URL support

## Install
1. install python 3.10+ (use pyenv!)
2. install postgresql
3. get the wheel
4. make a directory and virtual env
5. create maps db with correct user perms
6. set your SECRET environment variable
7. install the wheel
8. run init_db
9. waitress-serve it up

## Develop
1. update version variable
2. git tag release
3. cut a new wheel
4. scp to prod server
5. pip upgrade