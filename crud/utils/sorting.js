        const queryObj = { ...req.query }
        // //the spread operators ... are responsible to take out all the field out of the object
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el])



        // // advanced filtering


        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|lte|lt|gt)\b/g,match => `$${match}`)
        console.log(JSON.parse(queryStr));

        // // \b is used to  match the parsed words correctly




        let query = Tour.find(JSON.parse(queryStr))
        console.log(req.query)


        // console.log(req.query,queryObj)

        //first way :

        const tours = await Tour.find({
            duration:5,
            difficulty:'easy'
        })

        //second way: 

        tours = await Tour.find()
        .where('duration')
        .equals(5)
        .where('difficulty')
        .equals("easy")


        // sorting
         if(req.query.sort){
        const sortBy =  req.query.sort.split(',').join(' ')
           query = query.sort(sortBy)
         }else{
            query = query.sort("-createAt") 
         }



        // 3) limiting the fields


        if (req.query.fields) {
            const fields = req.query.fields.split(",").join(" ");
            query = query.select(fields)
        } else {
            query = query.select("-__v");


        //     //- sign means excluded


        }

        //  4) pagination

        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 100;
        const skip = (page - 1) * limit;
        // i.e if page = 3 and limit = 4 , skip = 2*4 = 8 then 8 results will be escaped


        // //page=2&limit(10),1-10 ,page 1, 11-20 ,page-2,21-30 page 3
        // // for skip when we request page 3 we need to know that page 3 will start from 21-30 then we need to skip 20 results that why the skip will equal to page -1 * limit to know the results to skip 
        // //skip is the amount of data that will be skipped while collecting the data

        query = query.skip(skip).limit(limit)

        if (req.query.page) {
            const numTours = await Tour.countDocuments();
            if (skip >= numTours) throw new Error("The page does not exist ");
        }