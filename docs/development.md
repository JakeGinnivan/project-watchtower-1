# Development of Project Watchtower

Linking Project Watchtower into projects with `yarn link` unfortunately does not work. Here's one (hacky) way to test unpublished versions:

Build and pack Project Watchtower into a `.tgz` file:
```
npm pack
```

In the project you want to use it, add the `.tgz` file as a dependency:
```
yarn add file:/../project-watchtower-0.0.1.tgz
```

To update:
```
yarn cache clean
rm -rf node_modules
rm yarn.lock
yarn
```