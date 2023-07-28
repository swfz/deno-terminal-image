# deno-terminal-image

OGP Image builder

## url

example

```
https://terminal-image.deno.dev/?title=awesome_title&tags=tag1,tag2,tag3
```

### parameter

available GET url parameters

| key | value | remark |
|:-|:-|:-|
| title | title | required |
| texts | StatusLine Texts. separeted `,` | e.g) hoge,fuga |
| top_colors | Top StatusLine background colors, separeted `,`, removed `#` | e.g) 999999,EFEFEF |
| top_color | Top StatusLine texts color, removed `#` | e.g) 999999 |
| bottom_colors | Bottom StatusLine background colors, separeted `,`, removed `#` | e.g) 999999,EFEFEF |
| bottom_color | Bottom StatusLine texts color, removed `#` | e.g) 999999 |
| prompt_color | Prompt(`$`) color, removed `#` | |
| title_color | Title color, removed `#` | |
| cursor_color | Cursor color, removed `#` | |
| tags | Bottom StatusLine texts, separeted `,` | e.g) JavaScript,Deno |
| bg_color | Background color | |
| command_color | Command(`article --title`) color | |


## URL Generator

If you want to create URLs or actually try things out, please use this URLGenerator.

[terminal-image.deno.dev/generator](https://terminal-image.deno.dev/generator)

## development

- run

```
deno run --allow-net --allow-read --allow-env  --watch ogp.ts
```

- deploy

```
deno run --allow-net --allow-read --allow-env --allow-write  bundle.ts
deployctl deploy --project=til-ogp --prod ogp.ts
```

## sample

![sample](sample.png)
