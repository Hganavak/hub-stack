import { Component, OnInit, OnDestroy, Type } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { pluck, flatMap, catchError } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponentService } from '@app/app.component.service';
import { BodyMediaService } from '@services/body-media.service';
import {
  AllArticlesGQL,
  AllArticlesSlugsGQL,
  GetArticleBySlugGQL,
  ArticleCollection,
  Article,
} from '@graphql/schema';
import { CerGraphqlService } from '@services/cer-graphql.service';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { NodeRenderer } from 'ngx-contentful-rich-text';
import { BodyMediaComponent } from '@components/shared/body-media/body-media.component';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss']
})
export class ArticlesComponent implements OnInit, OnDestroy {
  nodeRenderers: Record<string, Type<NodeRenderer>> = {
    [BLOCKS.QUOTE]: BodyMediaComponent,
    [BLOCKS.EMBEDDED_ASSET]: BodyMediaComponent,
    [BLOCKS.EMBEDDED_ENTRY]: BodyMediaComponent,
    [INLINES.ASSET_HYPERLINK]: BodyMediaComponent,
    [INLINES.EMBEDDED_ENTRY]: BodyMediaComponent,
    [INLINES.ENTRY_HYPERLINK]: BodyMediaComponent,
  };

  public isMobile: Boolean;
  public bannerTextStyling;
  public slug: string;
  public article;
  public article$: Subscription;
  public route$: Subscription;
  public bodyLinks$: Subscription;
  public allArticles$: Observable<ArticleCollection>;
  public parentSubHubs;

  constructor(
    public route: ActivatedRoute,
    public allArticlesGQL: AllArticlesGQL,
    public allArticlesSlugsGQL: AllArticlesSlugsGQL,
    public getArticleBySlugGQL: GetArticleBySlugGQL,
    public cerGraphQLService: CerGraphqlService,
    public appComponentService: AppComponentService,
    public bodyMediaService: BodyMediaService,
    public router: Router,
    private deviceService: DeviceDetectorService,
  ) { this.detectDevice(); }
  
  /**
   * Detect if device is Mobile
   */
  detectDevice() {
    this.isMobile = this.deviceService.isMobile();
  }

  async ngOnInit() {
    /**
     * Check if there is a slug URL parameter present. If so, this is
     * passed to the getArticleBySlug() method.
     */
      this.route$ = this.route.params.subscribe(params => {
        this.slug = params.slug || this.route.snapshot.data.slug;
        this._loadContent();
      });

      /**
       * Set styling for text if banner is present
       */
      this.bannerTextStyling = 'color: white; text-shadow: 0px 0px 8px #333333;';
  }

  /**
   * Function that loads the article/collection depending on if a slug is present.
   */
  private async _loadContent() {
    /**
     * If this.slug is defined, we're loading an individual article,
     * therefore run the corresponding query. If not, return all articles.
     */
    if (!!this.slug) {
      // Check if the article slug is valid otherwise redirect to 404
      this.getAllArticlesSlugs().subscribe(data => {
        let slugs = [];
          data.items.forEach(data => {
            slugs.push(data.slug)
          })
        if (!slugs.includes(this.slug)) { this.router.navigate(['error/404'])}
      });
      this.article = this.getArticleBySlug(this.slug);
      this.article$ = this.getArticleBySlug(this.slug).subscribe(data => {
        this.detectDevice();
        // Strip nulls from related collection data.
        data.relatedContactsCollection.items = data.relatedContactsCollection.items.filter(item => item);
        data.relatedDocsCollection.items = data.relatedDocsCollection.items.filter(item => item);
        data.relatedItemsCollection.items = data.relatedItemsCollection.items.filter(item => item);
        data.relatedOrgsCollection.items = data.relatedOrgsCollection.items.filter(item => item);

        this.bodyMediaService.setBodyMedia(data.bodyText?.links);
        this.appComponentService.setTitle(data.title);
      });
      this.parentSubHubs = await this.cerGraphQLService.getParentSubHubs(this.slug);
    } else {
      this.appComponentService.setTitle('Articles');
      this.allArticles$ = this.getAllArticles();
      try { this.article$.unsubscribe(); } catch {}
    }
  }

  /**
   * Function that returns all articles from the ArticleCollection as an observable
   * of type ArticleCollection. This is then unwrapped with the async pipe.
   *
   * This function is only called if no slug parameter is present in the URL, i.e. the
   * user is visiting article/slug-name.
   */
  public getAllArticles(): Observable<ArticleCollection> {
    try {
      return this.allArticlesGQL.fetch()
        .pipe(pluck('data', 'articleCollection')) as Observable<ArticleCollection>
    } catch (e) { console.error('Error loading all articles:', e) };
  }

  /**
   * Function that returns all articles slugs from the ArticleCollection as an observable
   * of type ArticleCollection. This is then unwrapped with the async pipe.
   *
   * This function called to determine if a valid slug has been searched otherwise redirect
   *
   */
  public getAllArticlesSlugs(): Observable<ArticleCollection> {
    try {
      return this.allArticlesSlugsGQL.fetch()
        .pipe(pluck('data', 'articleCollection')) as Observable<ArticleCollection>
    } catch (e) { console.error('Error loading all articles:', e) };
  }

  /**
   * Function that returns an individual article from the ArticleCollection by it's slug
   * as an observable of type Article. This is then unwrapped with the async pipe.
   *
   * This function is only called if no slug parameter is present in the URL, i.e.
   * the user is visiting /articles.
   *
   * @param slug The article's slug. Retrieved from the route parameter of the same name.
   */
  public getArticleBySlug(slug: string): Observable<Article> {
    try {
      return this.getArticleBySlugGQL.fetch({ slug: this.slug })
        .pipe(flatMap(x => x.data.articleCollection.items)) as Observable<Article>;
    } catch (e) { console.error(`Error loading article ${slug}:`, e); }
  }

  ngOnDestroy() {
    try {
      this.article$.unsubscribe();
      this.route$.unsubscribe();
      this.bodyLinks$.unsubscribe();
    } catch {}
  }
}
