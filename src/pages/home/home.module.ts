import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { HomePage } from './home';
import { ViewerComponentModule} from "../../components/viewer/viewer.module";

@NgModule({
	declarations: [HomePage],
	imports: [
    ViewerComponentModule,
    IonicPageModule.forChild(HomePage)
  ],
	providers: []
})
export class HomePageModule {}
