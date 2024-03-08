export class HttpStatusCodes {
    public static readonly CONTINUE = 100;
    public static readonly SWITCHING_PROTOCOLS = 101;
    public static readonly PROCESSING = 102;
    public static readonly EARLY_HINTS = 103;

    public static readonly OK = 200;
    public static readonly CREATED = 201;
    public static readonly ACCEPTED = 202;
    public static readonly NON_AUTHORITATIVE_INFORMATION = 203;
    public static readonly NO_CONTENT = 204;
    public static readonly RESET_CONTENT = 205;
    public static readonly PARTIAL_CONTENT = 206;
    public static readonly MULTI_STATUS = 207;
    public static readonly ALREADY_REPORTED = 208;
    public static readonly IM_USED = 226;

    public static readonly MULTIPLE_CHOICES = 300;
    public static readonly MOVED_PERMANENTLY = 301;
    public static readonly FOUND = 302;
    public static readonly SEE_OTHER = 303;
    public static readonly NOT_MODIFIED = 304;
    public static readonly USE_PROXY = 305;
    public static readonly TEMPORARY_REDIRECT = 307;
    public static readonly PERMANENT_REDIRECT = 308;

    public static readonly BAD_REQUEST = 400;
    public static readonly UNAUTHORIZED = 401;
    public static readonly PAYMENT_REQUIRED = 402;
    public static readonly FORBIDDEN = 403;
    public static readonly NOT_FOUND = 404;
    public static readonly METHOD_NOT_ALLOWED = 405;
    public static readonly NOT_ACCEPTABLE = 406;
    public static readonly PROXY_AUTHENTICATION_REQUIRED = 407;
    public static readonly REQUEST_TIMEOUT = 408;
    public static readonly CONFLICT = 409;
    public static readonly GONE = 410;
    public static readonly LENGTH_REQUIRED = 411;
    public static readonly PRECONDITION_FAILED = 412;
    public static readonly PAYLOAD_TOO_LARGE = 413;
    public static readonly URI_TOO_LONG = 414;
    public static readonly UNSUPPORTED_MEDIA_TYPE = 415;
    public static readonly RANGE_NOT_SATISFIABLE = 416;
    public static readonly EXPECTATION_FAILED = 417;
    public static readonly I_AM_A_TEAPOT = 418;
    public static readonly MISDIRECTED_REQUEST = 421;
    public static readonly UNPROCESSABLE_ENTITY = 422;
    public static readonly LOCKED = 423;
    public static readonly FAILED_DEPENDENCY = 424;
    public static readonly TOO_EARLY = 425;
    public static readonly UPGRADE_REQUIRED = 426;
    public static readonly PRECONDITION_REQUIRED = 428;
    public static readonly TOO_MANY_REQUESTS = 429;
    public static readonly REQUEST_HEADER_FIELDS_TOO_LARGE = 431;
    public static readonly UNAVAILABLE_FOR_LEGAL_REASONS = 451;

    public static readonly INTERNAL_SERVER_ERROR = 500;
    public static readonly NOT_IMPLEMENTED = 501;
    public static readonly BAD_GATEWAY = 502;
    public static readonly SERVICE_UNAVAILABLE = 503;
    public static readonly GATEWAY_TIMEOUT = 504;
    public static readonly HTTP_VERSION_NOT_SUPPORTED = 505;
    public static readonly VARIANT_ALSO_NEGOTIATES = 506;
    public static readonly INSUFFICIENT_STORAGE = 507;
    public static readonly LOOP_DETECTED = 508;
    public static readonly NOT_EXTENDED = 510;
    public static readonly NETWORK_AUTHENTICATION_REQUIRED = 511;
}

export class EndpointRequestTypes {
    public static get: string = "GET";
    public static post: string = "POST";
    public static put: string = "PUT";
    public static delete: string = "DELETE";
}