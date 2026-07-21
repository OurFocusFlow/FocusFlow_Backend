
import { AnyKeys, CreateOptions, DeleteResult, FlattenMaps, HydratedDocument, Model, PopulateOptions, ProjectionType, QueryFilter, QueryOptions, ReturnsNewDoc, Types, UpdateQuery, UpdateResult, UpdateWithAggregationPipeline } from "mongoose";
// import { IPaginate } from "../../common/interfaces/index";
import { UpdateOptions } from "mongodb";


export abstract class DatabaseRepository <TRowDoc> {
    constructor(protected readonly model:Model<TRowDoc>){
        
    }
    // create
    async create({
        data,
    }:{
        data:AnyKeys<TRowDoc>,
    }):Promise<HydratedDocument<TRowDoc>>;

    
    async create({
        data,
        option
    }:{
        data:AnyKeys<TRowDoc>[],
        option?:CreateOptions | undefined
    }):Promise<HydratedDocument<TRowDoc>[]>
    
    
    
    async create({
        data,
        option
    }:{
        data:AnyKeys<TRowDoc>[] | AnyKeys<TRowDoc>,
        option?:CreateOptions | undefined
    }):Promise<HydratedDocument<TRowDoc>[] | HydratedDocument<TRowDoc> > {
        return await this.model.create(data as any ,option)
    }
    async createOne({
        data,
        option
    }:{
        data:AnyKeys<TRowDoc>,
        option?:CreateOptions | undefined
    }):Promise<HydratedDocument<TRowDoc>>{
        const [doc] =  await this.create({data : [data] ,option}) || []
        return doc as HydratedDocument<TRowDoc>
    }
    // insert many
    async insertMany({
        data,
    }:{
        data:AnyKeys<TRowDoc>[],
    }):Promise<HydratedDocument<TRowDoc>[] > {
        return await this.model.insertMany(data as any ) as HydratedDocument<TRowDoc>[]
    }
    // findOne
    
    async findOne({
        filter,
        projection,
        options
    }:{
        filter?: QueryFilter<TRowDoc>,
        projection?: ProjectionType<TRowDoc> | null | undefined,
        options?: QueryOptions<TRowDoc> & {lean:false} | null | undefined
    }):Promise<HydratedDocument<TRowDoc> | null >
    async findOne({
        filter,
        projection,
        options
    }:{
        filter?: QueryFilter<TRowDoc>,
        projection?: ProjectionType<TRowDoc> | null | undefined,
        options?: QueryOptions<TRowDoc>  & {lean:true}  | null | undefined
    }):Promise<null | FlattenMaps<TRowDoc>>
    async findOne({
        filter,
        projection,
        options
    }:{
        filter?: QueryFilter<TRowDoc>,
        projection?: ProjectionType<TRowDoc> | null | undefined,
        options?: QueryOptions<TRowDoc>  | null | undefined
    }):Promise<any>{
        const doc =  this.model.findOne(filter,projection)
        if (options?.lean) doc.lean(options.lean);
        if (options?.populate) doc.populate(options.populate as PopulateOptions[]);
            return await doc.exec() 
    }
    async find({
        filter,
        projection,
        options
    }:{
        filter?: QueryFilter<TRowDoc>,
        projection?: ProjectionType<TRowDoc> | null | undefined,
        options?: QueryOptions<TRowDoc>  | null | undefined
    }):Promise<HydratedDocument<TRowDoc>[]>{
        const doc =  this.model.find(filter,projection)
        if (options?.lean) doc.lean(options.lean);
        if (options?.skip) doc.skip(options.skip);
        if (options?.limit) doc.limit(options.limit);
        if (options?.populate) doc.populate(options.populate as PopulateOptions[]);
            return await doc.exec() 
    }

    // async paginate({
    //     filter,
    //     projection,
    //     options = {},
    //     page = 0,
    //     size =5
    // }:{
    //     filter?: QueryFilter<TRowDoc>,
    //     projection?: ProjectionType<TRowDoc> | null | undefined,
    //     options?: QueryOptions<TRowDoc>  ,
    //     page?:number | string| undefined,
    //     size?:number | string| undefined,
    // }):Promise<IPaginate<TRowDoc>>{
    //     let count : number = -1
    //     if (Number(page) > 0) {
    //         page = parseInt(page as string)
    //         size = parseInt(size as string)
    //         options.skip = (page - 1 ) * size
    //         options.limit =  size
    //         count = await this.model.countDocuments({filter})
    //     }
    //     const docs = await this.find({filter:filter||{},projection,options})
    //     return {docs,
    //         ...(Number(page)>0?{currentPage:page,size,pages:Math.ceil(count/parseInt(size as string))}:{})
    //     }
    // }
    // findById
    async findById({
        _id,
        projection,
        options
    }:{
        _id?: Types.ObjectId,
        projection?: ProjectionType<TRowDoc> | null | undefined,
        options?: QueryOptions<TRowDoc> & {lean:false} | null | undefined
    }):Promise<HydratedDocument<TRowDoc> | null >
    async findById({
        _id,
        projection,
        options
    }:{
        _id?: Types.ObjectId,
        projection?: ProjectionType<TRowDoc> | null | undefined,
        options?: QueryOptions<TRowDoc>  & {lean:true}  | null | undefined
    }):Promise<null | FlattenMaps<TRowDoc>>
    async findById({
        _id,
        projection,
        options
    }:{
        _id?: Types.ObjectId,
        projection?: ProjectionType<TRowDoc> | null | undefined,
        options?: QueryOptions<TRowDoc>  | null | undefined
    }):Promise<any>{
        const doc =  this.model.findById(_id,projection)
        if (options?.lean) doc.lean(options.lean);
        if (options?.populate) doc.populate(options.populate as PopulateOptions[]);
            return await doc.exec() 
    }
    // update
    async  updateOne({
        filter,
        update,
        options
    }:{
        filter: QueryFilter<TRowDoc>,
        update: UpdateQuery<TRowDoc> | UpdateWithAggregationPipeline,
        options?:UpdateOptions | null
    }):Promise<UpdateResult> {
        return await this.model.updateOne(filter,update,options)
    }
    async  updateMany({
        filter,
        update,
        options
    }:{
        filter: QueryFilter<TRowDoc>,
        update: UpdateQuery<TRowDoc> | UpdateWithAggregationPipeline,
        options?:UpdateOptions | null
    }):Promise<UpdateResult> {
        return await this.model.updateMany(filter,update,options)
    }
    // findOnde and Update
    async  findOneAndUpdate({
        filter,
        update,
        options = {new:true}
    }:{
        filter: QueryFilter<TRowDoc>,
        update: UpdateQuery<TRowDoc>,
        options?: QueryOptions<TRowDoc> &  ReturnsNewDoc
    }):Promise<HydratedDocument<TRowDoc>|null> {
        if (Array.isArray(update)) {
            update.push({$set:{__v:{$add:['$__v',1]}}})
            return await this.model.findOneAndUpdate(filter,update,{...options,updatePipeline:true})
        }
        return await this.model.findOneAndUpdate(filter,update,{...options,$incr:{__v:1}})
    }
    // findByID and Update
    async  findByIdAndUpdate({
        _id,
        update,
        options = {new:true}
    }:{
        _id: Types.ObjectId,
        update: UpdateQuery<TRowDoc>,
        options: QueryOptions<TRowDoc> &  ReturnsNewDoc
    }):Promise<HydratedDocument<TRowDoc>|null> {
        return await this.model.findByIdAndUpdate(_id,update,options)
    }

    // delete
    async  deleteOne({
        filter,
    }:{
        filter: QueryFilter<TRowDoc>,
    }):Promise<DeleteResult> {
        return await this.model.deleteOne(filter)
    }
    async  deleteMany({
        filter,

    }:{
        filter: QueryFilter<TRowDoc>,
    }):Promise<DeleteResult> {
        return await this.model.deleteMany(filter)
    }
      // findOnde and Delete
        async  findOneAndDelete({
        filter,

    }:{
        filter: QueryFilter<TRowDoc>,
    }):Promise<HydratedDocument<TRowDoc>|null> {
        return await this.model.findOneAndDelete(filter)
    }
        // findByID and delete
    async  findByIdAndDelete({
        _id
    }:{
        _id: Types.ObjectId,
    }):Promise<HydratedDocument<TRowDoc>|null> {
        return await this.model.findByIdAndDelete(_id)
    }

}