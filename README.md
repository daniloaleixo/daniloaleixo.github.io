# daniloaleixo.github.io

Personal portfolio site for Danilo Aleixo — Tech Lead, Berlin.

Live at [daniloaleixo.github.io](https://daniloaleixo.github.io).

## Structure

Static site, no build step. Open `index.html` directly, or serve it:

```bash
python3 -m http.server 8000
```

- `index.html` — the whole page: sidebar plus five tabs (About, Resume, Portfolio, Blog, Contact)
- `assets/css/style.css` — stylesheet
- `assets/js/script.js` — tab navigation, portfolio filtering, form validation
- `assets/images/` — avatar, project and blog images, favicons
- `assets/Resume.pdf` — downloadable CV

External runtime dependencies: [Ionicons](https://ionic.io/ionicons) and Google Fonts
(Poppins), both via CDN. The contact form posts to [Formspree](https://formspree.io).

> **Note:** the contact form is not live yet. `index.html` still points the form's
> `action` at the placeholder `https://formspree.io/f/FORMSPREE_FORM_ID`. Replace
> `FORMSPREE_FORM_ID` with a real Formspree form ID before deploying — until then,
> submissions will 404.

## Updating the blog

The Blog tab is hand-maintained. After publishing on
[Medium](https://medium.com/@daniloaleixo94), add a card to `<ul class="blog-posts-list">`
in `index.html`, drop its banner image into `assets/images/`, and remove the oldest card.

## Credits

Built on the [vCard personal portfolio](https://github.com/codewithsadee/vcard-personal-portfolio)
template by [codewithsadee](https://github.com/codewithsadee), used under the MIT License.
The upstream license notice is reproduced unchanged in [LICENSE-vcard](./LICENSE-vcard).

## License

MIT — see [LICENSE](./LICENSE).
