const mongoose = require("mongoose")
const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Name is required"],
            maxLength: [50, "Name must be less than 50"]
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true
        },
        password: {
            type: String,
            required: [true, "password is required"],
            minLength: [8, "password must be at least 8 characters"],
            select: false
        },
    },
    {
        timestamps: true
    }
);

// challenge 1 - encrypt password - hooks
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

// add more featuers directly to your schema
userSchema.methods = {
    //compare password
    comparePassword: async function (enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password)
    },

    //generate JWT TOKEN
    getJwtToken: function () {
        return JWT.sign(
            {
                _id: this._id,
                role: this.role
            },
            process.env.JWT_SECRET,
            // {
            //     expiresIn: process.env.JWT_EXPIRY
            // }
        )
    },

    generateForgotPasswordToken: function(){
        const forgotToken = crypto.randomBytes(20).toString('hex');

        //step 1 - save to DB
        this.forgotPasswordToken = crypto
        .createHash("sha256")
        .update(forgotToken)
        .digest("hex")

        this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000
        //step 2 - return values to user

        return forgotToken

    }
}



module.exports = mongoose.model("User", userSchema)