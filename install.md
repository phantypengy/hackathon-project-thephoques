# Linux (Ubuntu / Debian) & MacOS

## Step 1: Installing dependencies

Clone the repo:

```bash
git clone https://github.com/phantypengy/hackathon-project-sealio
```

After cloning the repo make sure you have Node.js, npm and PostgreSQL installed;

### Debian-based Linux Distributions (+ Ubuntu)

```bash
sudo apt install nodejs npm
sudo apt install postgresql
```

### Arch-based Linux Distributions

```bash
sudo pacman -S nodejs npm
sudo pacman -S postgresql
```

### MacOS

```bash
brew install nodejs npm
brew install postgresql
```

## Step 2: Start PostgreSQL services

### Linux

```bash
sudo systemctl start postgresql
```

### MacOS

```bash
brew services start postgresql@18
```

**NOTE:** your version of postgres might be different, you can check version with this command:

```bash
psql -V
# This will return something like this example:
psql (PostgreSQL) 18.3 (Homebrew)
# Note the number (ignoring decimal point) as your version, so in the example above the version is 18
```

## Step 3: Install node dependencies

In your terminal, navigate to the repo's folder and enter this command:

```bash
npm install
```

This will automatically install all dependencies and create a folder called node_modules

## Step 4: Create Postgres user

### Linux
```bash
sudo -i -u postgres psql -c "CREATE USER yourusername WITH SUPERUSER;"
```

### MacOS
```bash
psql postgres -c "CREATE USER yourusername WITH SUPERUSER;"
```

In both, replace yourusername with your system username

## Step 5: Setup the databse
In terminal, navigate to repo-folder/SQL/
Run this command: 

```bash
psql -d postgres -f setup.sql
```

This creates the database. Note that the database is called "sealio_database".

Now, create the tables:

```bash
psql -d sealio_database -f main.sql
```

## Step 6: Create uploads folder **IMPORTANT**
In the repo's root dir, create a folder called "uploads" with two folders inside of it called "videos" and "thumbnails".
