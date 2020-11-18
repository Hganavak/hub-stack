import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { pluck, tap, flatMap, map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { 
    EquipmentCollection, 
    AllEquipmentGQL, 
    AllEquipmentQuery, 
    AllSearchableContentPublicFieldsGQL, 
    AllSearchableContentPublicFieldsQuery, 
    GetEquipmentBySlugGQL,
    GetEquipmentByIdGQL,
    Equipment 
} from '../../graphql/schema';
import { CerGraphqlService } from '../../services/cer-graphql.service';


@Component({
  selector: 'app-equipment',
  templateUrl: './equipment.component.html',
  styleUrls: ['./equipment.component.scss']
})
export class EquipmentComponent implements OnInit {

  public allEquipment$: Observable<EquipmentCollection>;
  public equipment$: Observable<Equipment>;
  public slug: string;
  // public assets: Array<any>;
  // public inlineEntry: Array<any>;
  // public blockEntry: Array<any>;
  // public hyperlinkEntry: Array<any>;
  public parentSubHubs;

  constructor(
    public route: ActivatedRoute,
    public allEquipmentGQL: AllEquipmentGQL,
    public getEquipmentBySlugGQL: GetEquipmentBySlugGQL,
    public getEquipmentByIDGQL: GetEquipmentByIdGQL,
    public cerGraphQLService: CerGraphqlService
  ) { }

  async ngOnInit() {
    /**
     * Check if there is a slug URL parameter present. If so, this is
     * passed to the getArticleBySlug() method.
     */
    this.slug = this.route.snapshot.params.slug || this.route.snapshot.data.slug;

    /**
     * If this.slug is defined, we're loading an individual article,
     * therefore run the corresponding query. If not, return all articles.
     */
    if (!!this.slug) {
      this.getEquipmentBySlug(this.slug).subscribe(data => {
        this.equipment$ = this.getEquipmentByID(data.sys.id);
        // this.equipment$.subscribe(data => {
        //   this.assets = data.body.links.assets.block;
        //   this.inlineEntry = data.body.links.entries.inline;
        //   this.blockEntry = data.body.links.entries.block;
        //   this.hyperlinkEntry = data.body.links.entries.hyperlink;
        // });
      });
      this.parentSubHubs = await this.cerGraphQLService.getParentSubHubs(this.slug);
    } else {
      this.allEquipment$ = this.getAllEquipment();
    }
  }

  /**
   * Function that returns all articles from the ArticleCollection as an observable
   * of type ArticleCollection. This is then unwrapped with the async pipe.
   *
   * This function is only called if no slug parameter is present in the URL, i.e. the
   * user is visiting article/slug-name.
   */
  public getAllEquipment(): Observable<EquipmentCollection> {
    try {
      return this.allEquipmentGQL.fetch()
        .pipe(pluck('data', 'equipmentCollection')) as Observable<EquipmentCollection>
    } catch (e) { console.error('Error loading all equipment:', e) };
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
  public getEquipmentBySlug(slug: string): Observable<Equipment> {
    try {
      return this.getEquipmentBySlugGQL.fetch({ slug: this.slug })
        .pipe(flatMap(x => x.data.equipmentCollection.items)) as Observable<Equipment>;
    } catch (e) { console.error(`Error loading equipment ${slug}:`, e); }
  }

  /**
   * Function that returns an individual article from the ArticleCollection by it's ID
   * as an observable of type Article. This is then unwrapped with the async pipe.
   * ID is retrieved by subscribing to 'getArticleBySlug'.
   */
  public getEquipmentByID(id: string): Observable<Equipment> {
    try {
      return this.getEquipmentByIDGQL.fetch({id: id})
        .pipe(map(x => x.data.equipment)) as unknown as Observable<Equipment>;
    } catch (e) { console.error(`Error loading article ${id}:`, e); }
  }
}