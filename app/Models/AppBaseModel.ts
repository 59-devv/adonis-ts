import { BaseModel } from '@ioc:Adonis/Lucid/Orm';
import CamelCaseNamingStrategy from 'App/strategies/CamelCaseNamingStrategy';

export default class AppBaseModel extends BaseModel {
    // [Strategy] SnakeCase -> CamelCase 
    public static namingStrategy = new CamelCaseNamingStrategy()
}