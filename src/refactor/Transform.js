

/**
 * Represents one or more transformations
 * 
 * 3x3 matrix in column major order
 */

//add - track inverse transformation

export class Transform{

    static dummy;
    static matrixMult;

    m; //matrix representation of the transformation
    
    i;  //inverse of the transformation

    static{
        this.identityMatrix = [

            //first col
            1,
            0,

            //second col
            0,
            1,

            //3rd col
            0,
            0,
        ];

        this.dummy = new Transform();
    }

    constructor(){
        // default to identity matrix
        this.m = [...Transform.identityMatrix];
        this.i = [...Transform.identityMatrix];
    }

    /**
     * Starting from this transform, apply otherTransform
     * 
     * mutates this one to reflect the combined result
     * 
     * @param {Transform} otherTransform 
     */
    applyToSelf(otherTransform){
        
        this.m = Transform.matrixMult(this.m, otherTransform.m);    // combined transformation

        this.i = Transform.matrixMult(otherTransform.i, this.i);    //combined inverse

        
    }

    clone(){
        const T = new Transform()
        T.m = [...this.m];
        T.i = [...this.i];
    }

    static matrixMult(A, B){
        const M = new Array(6);

        const [ a,  c,  e,
                b,  d,  f,  ]   =
            //  0   0   1   

                [   A[0],   A[2],   A[4],
                    A[1],   A[3],   A[5]    ];
                //  0       0       1

        const [ q,  s,  u,
                r,  t,  v,  ]   =
            //  0   0   1

            [   B[0],   B[2],   B[4],
                B[1],   B[3],   B[5]    ];
            //  0       0       1


        /*
        *   m array indices
        *   [0] [2] [4]     |   [0] [2] [4]
        *   [1] [3] [5]     |   [1] [3] [5]
        *   [x] [x] [x]     |   [x] [x] [x]
        * 
        */

        //multipy A rows by B cols 


        //first row
        M[0] = a*q + c*r // + e*0
        M[2] = a*s + c*t // + e*0
        M[4] = a*u + c*v + e*1

        //second row
        M[1] = b*q + d*r // + f*0
        M[3] = b*s + d*t // + f*0
        M[5] = b*u + d*v + f*1

        //third row
        //  [x] = 0*q + 0*r + 1*0 -> always 0
        //  [x] = 0*s + 0*t + 1*0 -> always 0
        //  [x] = 0*u + 0*v + 1*1 -> always 1

        return M;
    }

    setToIdentity(){
        for(let n = 0; n < 6; n++){
            this.m[n] = Transform.identityMatrix[n];
            this.i[n] = Transform.identityMatrix[n];
        }
    }

    //configure as a scale transformation
    setToScale(s){
        this.setToIdentity();

        //set matrix
        this.m[0] = s;
        this.m[3] = s;

        //set inverse matrix
        this.i[0] = 1/s;
        this.i[3] = 1/s;
    }

    setToTranslation(x, y){
        this.setToIdentity();

        //set matrix
        this.m[4] = x;
        this.m[5] = y;

        //set inverse matrix
        this.i[4] = -x;
        this.i[5] = -y;
    }
    
    scale(s){
        Transform.dummy.setToScale(s);
        this.applyToSelf(Transform.dummy);
        return this;
    }

    translate(x, y){
        Transform.dummy.setToTranslation(x, y);
        this.applyToSelf(Transform.dummy);
        return this;
    }

    /**
     * apply this transformation to a point and return the new coordinates
     * @param {Number} x 
     * @param {Number} y 
     * @returns an array containing the new point [tx, ty]
     */
    transformPoint(x, y){
        /*
            treat point as 1x3 column matrix w padding 1
            x,
            y,
            1
        */

        return [
            this.m[0]*x + this.m[2]*y + this.m[4],
            this.m[1]*x + this.m[3]*y + this.m[5]
        ]            
    }

    /**
     * apply this transformation's inverse to a point and return the new coordinates
     * @param {Number} x 
     * @param {Number} y 
     * @returns an array containing the new point [ix, iy]
     */
    inversePoint(x, y){
        return [
            this.i[0]*x + this.i[2]*y + this.i[4],
            this.i[1]*x + this.i[3]*y + this.i[5]
        ]
    }
}